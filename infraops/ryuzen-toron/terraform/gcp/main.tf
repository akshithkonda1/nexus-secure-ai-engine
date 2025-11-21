provider "google" {
  project = "YOUR_PROJECT_ID"
  region  = "us-central1"
}

resource "google_container_cluster" "ryuzen" {
  name     = "ryuzen-gke"
  location = "us-central1"

  initial_node_count = 2
  node_config {
    machine_type = "e2-medium"
  }
}
