provider "azurerm" {
  features {}
}

resource "azurerm_kubernetes_cluster" "ryuzen" {
  name                = "ryuzen-aks"
  location            = "East US"
  resource_group_name = "ryuzen-rg"
  dns_prefix          = "ryuzen"

  default_node_pool {
    name       = "nodepool"
    node_count = 2
    vm_size    = "Standard_DS2_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}
