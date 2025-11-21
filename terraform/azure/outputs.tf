output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.toron.name
}

output "kube_api_server" {
  description = "AKS API server endpoint"
  value       = azurerm_kubernetes_cluster.toron.kube_config[0].host
}

output "acr_login_server" {
  description = "ACR login server"
  value       = azurerm_container_registry.toron.login_server
}

output "acr_image_uri" {
  description = "Sample image URI including tag"
  value       = format("%s/toron-engine:%s", azurerm_container_registry.toron.login_server, var.image_tag)
}
