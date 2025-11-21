#############################
# Azure Toron IaC
# Provisions AKS cluster, ACR, and networking.
#############################

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }
  backend "azurerm" {
    resource_group_name  = "toron-tfstate"
    storage_account_name = "toronstate"
    container_name       = "tfstate"
    key                  = "azure/toron.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Resource group for all Azure assets
resource "azurerm_resource_group" "toron" {
  name     = "rg-toron"
  location = var.region
}

# Virtual network and subnet for AKS
resource "azurerm_virtual_network" "toron" {
  name                = "vnet-toron"
  address_space       = ["10.20.0.0/16"]
  location            = azurerm_resource_group.toron.location
  resource_group_name = azurerm_resource_group.toron.name
}

resource "azurerm_subnet" "toron" {
  name                 = "snet-toron"
  resource_group_name  = azurerm_resource_group.toron.name
  virtual_network_name = azurerm_virtual_network.toron.name
  address_prefixes     = ["10.20.1.0/24"]
}

# Private container registry
resource "azurerm_container_registry" "toron" {
  name                = "toronregistry"
  resource_group_name = azurerm_resource_group.toron.name
  location            = azurerm_resource_group.toron.location
  sku                 = "Standard"
  admin_enabled       = false
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.toron.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.toron.kubelet_identity[0].object_id

  depends_on = [azurerm_kubernetes_cluster.toron]
}

resource "azurerm_kubernetes_cluster" "toron" {
  name                = "aks-toron"
  location            = azurerm_resource_group.toron.location
  resource_group_name = azurerm_resource_group.toron.name
  dns_prefix          = "toron"

  default_node_pool {
    name       = "system"
    node_count = var.replica_count
    vm_size    = "Standard_DS2_v2"
    vnet_subnet_id = azurerm_subnet.toron.id
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    load_balancer_sku = "standard"
  }
}
