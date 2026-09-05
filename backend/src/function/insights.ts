type Signals = {
  core: any;
  system: any;
  infra: any;
  ai: any;
  quality: any;
  product: any;
};

export function generateInsights(signals: Signals, complexity_tags: string[], key_features: string[]) {

  if (
    signals.core.frontend &&
    signals.core.backend &&
    signals.core.database
  ) {
    complexity_tags.push("Full Stack Application");
  }

  if (signals.system.realtime) {
    complexity_tags.push("Real-time System");
    key_features.push(
      "Implemented real-time communication using WebSockets for low-latency updates"
    );
  }

  if (signals.system.eventDriven) {
    complexity_tags.push("Event-driven Architecture");
    key_features.push(
      "Designed asynchronous workflows using event-driven architecture and queues"
    );
  }

  if (signals.system.cron) {
    complexity_tags.push("Background Job Processing");
    key_features.push(
      "Built scheduled jobs for background processing and automation"
    );
  }

  if (signals.core.api) {
    key_features.push(
      "Developed scalable API layer for handling client-server communication"
    );
  }

  if (signals.core.auth) {
    key_features.push(
      "Implemented authentication and authorization using secure token-based systems"
    );
  }

  if (signals.core.database) {
    key_features.push(
      "Designed and integrated database schemas for persistent data storage"
    );
  }

  if (signals.infra.docker) {
    complexity_tags.push("Containerized Deployment");
    key_features.push(
      "Containerized application using Docker for consistent deployment environments"
    );
  }

  if (signals.infra.kubernetes) {
    complexity_tags.push("Distributed Systems / Orchestration");
    key_features.push(
      "Managed container orchestration using Kubernetes for scalability and resilience"
    );
  }

  if (signals.infra.ci) {
    key_features.push(
      "Integrated CI pipelines to automate testing and deployment workflows"
    );
  }

  if (signals.infra.cloud) {
    complexity_tags.push("Cloud Infrastructure");
    key_features.push(
      "Configured cloud infrastructure for deployment and scalability"
    );
  }

  if (signals.ai.ml) {
    complexity_tags.push("Machine Learning System");
    key_features.push(
      "Built and integrated machine learning models for data-driven functionality"
    );
  }

  if (signals.ai.training) {
    key_features.push(
      "Developed training pipelines for machine learning models"
    );
  }

  if (signals.ai.data) {
    key_features.push(
      "Processed and transformed large datasets for analysis and modeling"
    );
  }

  if (signals.product.payments) {
    key_features.push(
      "Integrated payment processing systems for handling transactions"
    );
  }

  if (signals.product.notifications) {
    key_features.push(
      "Implemented notification systems for real-time user updates"
    );
  }

  if (signals.product.upload) {
    key_features.push(
      "Built file upload and storage handling mechanisms"
    );
  }

  if (signals.product.search) {
    key_features.push(
      "Implemented search and filtering functionality for efficient data retrieval"
    );
  }

  if (signals.product.dashboard) {
    key_features.push(
      "Developed dashboards for data visualization and user insights"
    );
  }

  if (signals.quality.tests) {
    key_features.push(
      "Added automated tests to ensure reliability and maintainability"
    );
  }

  if (signals.quality.docs) {
    key_features.push(
      "Documented system architecture and usage for better developer experience"
    );
  }

  return {
    complexity_tags: [...new Set(complexity_tags)],
    key_features: [...new Set(key_features)].slice(0, 6), // keep it sharp
  };
}
