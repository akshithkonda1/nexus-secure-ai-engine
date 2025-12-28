#############################
# Database Module
# Aurora PostgreSQL Serverless v2
#############################

#---------------------------
# Random password for DB
#---------------------------
resource "random_password" "db_password" {
  count = var.deploy_aurora ? 1 : 0

  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

#---------------------------
# Aurora PostgreSQL Cluster
#---------------------------
resource "aws_rds_cluster" "main" {
  count = var.deploy_aurora ? 1 : 0

  cluster_identifier = "${var.name_prefix}-postgres"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = "15.4"
  database_name      = "ryuzen"
  master_username    = "ryuzen_admin"
  master_password    = random_password.db_password[0].result

  # Serverless v2 scaling
  serverlessv2_scaling_configuration {
    min_capacity = var.aurora_min_capacity
    max_capacity = var.aurora_max_capacity
  }

  # Networking
  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [aws_security_group.rds[0].id]

  # Backups
  backup_retention_period      = var.aurora_backup_retention
  preferred_backup_window      = "03:00-04:00"  # UTC
  preferred_maintenance_window = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot        = true

  # Encryption
  storage_encrypted = true
  kms_key_id        = var.kms_key_arn

  # Deletion protection
  deletion_protection       = var.environment == "production"
  skip_final_snapshot       = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${var.name_prefix}-final-snapshot" : null

  # Enhanced monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]

  # Enable Data API for Lambda
  enable_http_endpoint = true

  # IAM authentication
  iam_database_authentication_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-postgres"
    }
  )

  lifecycle {
    ignore_changes = [
      master_password  # Managed by Secrets Manager
    ]
  }
}

#---------------------------
# Aurora Cluster Instances
#---------------------------
resource "aws_rds_cluster_instance" "main" {
  count = var.deploy_aurora ? var.aurora_instance_count : 0

  identifier           = "${var.name_prefix}-postgres-${count.index}"
  cluster_identifier   = aws_rds_cluster.main[0].id
  instance_class       = "db.serverless"
  engine               = aws_rds_cluster.main[0].engine
  engine_version       = aws_rds_cluster.main[0].engine_version
  publicly_accessible  = false
  db_subnet_group_name = var.db_subnet_group_name

  # Performance Insights
  performance_insights_enabled          = true
  performance_insights_kms_key_id       = var.kms_key_arn
  performance_insights_retention_period = 7

  # Enhanced Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring[0].arn

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-postgres-${count.index}"
    }
  )
}

#---------------------------
# RDS Enhanced Monitoring Role
#---------------------------
resource "aws_iam_role" "rds_monitoring" {
  count = var.deploy_aurora ? 1 : 0

  name = "${var.name_prefix}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count = var.deploy_aurora ? 1 : 0

  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

#---------------------------
# RDS Security Group
#---------------------------
resource "aws_security_group" "rds" {
  count = var.deploy_aurora ? 1 : 0

  name        = "${var.name_prefix}-rds-sg"
  description = "Security group for Aurora PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from Lambda"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.lambda_security_group_id]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-rds-sg"
    }
  )
}

#---------------------------
# Store DB Credentials in Secrets Manager
#---------------------------
resource "aws_secretsmanager_secret_version" "db_credentials" {
  count = var.deploy_aurora ? 1 : 0

  secret_id = var.db_credentials_secret_arn
  secret_string = jsonencode({
    username = aws_rds_cluster.main[0].master_username
    password = random_password.db_password[0].result
    host     = aws_rds_cluster.main[0].endpoint
    port     = aws_rds_cluster.main[0].port
    database = aws_rds_cluster.main[0].database_name
    engine   = "postgres"
  })
}
