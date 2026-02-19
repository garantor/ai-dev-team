#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error when substituting.
# The return value of a pipeline is the status of the last command to exit with a non-zero status, or zero if all commands in the pipeline exit successfully.
set -euo pipefail

# --- Input Validation ---

# Check for required environment variables
if [ -z "${AWS_REGION}" ]; then
  echo "Error: AWS_REGION environment variable is not set." >&2
  exit 1
fi

if [ -z "${ECS_CLUSTER_NAME}" ]; then
  echo "Error: ECS_CLUSTER_NAME environment variable is not set." >&2
  exit 1
fi

if [ -z "${ECS_SERVICE_NAME}" ]; then
  echo "Error: ECS_SERVICE_NAME environment variable is not set." >&2
  exit 1

fi

if [ -z "${IMAGE_TAG}" ]; then
  echo "Error: IMAGE_TAG environment variable is not set." >&2
  exit 1
fi

if [ -z "${ECR_REGISTRY_URL}" ]; then
  echo "Error: ECR_REGISTRY_URL environment variable is not set." >&2
  exit 1
fi

if [ -z "${ECR_REPOSITORY_NAME}" ]; then
  echo "Error: ECR_REPOSITORY_NAME environment variable is not set." >&2
  exit 1
fi

# --- Deployment Logic ---

echo "Starting deployment to ECS staging environment..."

# Construct the full image URI
IMAGE_URI="${ECR_REGISTRY_URL}/${ECR_REPOSITORY_NAME}:${IMAGE_TAG}"

echo "Deploying image: ${IMAGE_URI} to cluster: ${ECS_CLUSTER_NAME}, service: ${ECS_SERVICE_NAME}"

# Get the current task definition ARN for the service
CURRENT_TASK_DEF_ARN=$(aws ecs describe-services \
  --cluster "${ECS_CLUSTER_NAME}" \
  --services "${ECS_SERVICE_NAME}" \
  --region "${AWS_REGION}" \
  --query 'services[0].taskDefinition' \
  --output text)

if [ -z "${CURRENT_TASK_DEF_ARN}" ]; then
  echo "Error: Could not retrieve current task definition for service ${ECS_SERVICE_NAME}." >&2
  exit 1
fi

echo "Current Task Definition ARN: ${CURRENT_TASK_DEF_ARN}"

# Describe the current task definition to get its JSON
TASK_DEFINITION_JSON=$(aws ecs describe-task-definition \
  --task-definition "${CURRENT_TASK_DEF_ARN}" \
  --region "${AWS_REGION}" \
  --query 'taskDefinition' \
  --output json)

if [ -z "${TASK_DEFINITION_JSON}" ]; then
  echo "Error: Could not retrieve task definition details for ${CURRENT_TASK_DEF_ARN}." >&2
  exit 1
fi

# Update the image in the task definition JSON
# This uses jq to modify the image field of the first container definition.
# You might need to adjust the jq path if your container is not the first one or has a different name.
NEW_TASK_DEFINITION_JSON=$(echo "${TASK_DEFINITION_JSON}" | \
  jq --arg IMAGE_URI "${IMAGE_URI}" \
  '.containerDefinitions[0].image = $IMAGE_URI | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.compatibilities)')

if [ -z "${NEW_TASK_DEFINITION_JSON}" ]; then
  echo "Error: Failed to update image in task definition JSON." >&2
  exit 1
fi

# Register a new task definition
REGISTERED_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json "${NEW_TASK_DEFINITION_JSON}" \
  --region "${AWS_REGION}" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

if [ -z "${REGISTERED_TASK_DEF_ARN}" ]; then
  echo "Error: Failed to register new task definition." >&2
  exit 1
fi

echo "New Task Definition ARN registered: ${REGISTERED_TASK_DEF_ARN}"

# Update the ECS service to use the new task definition
aws ecs update-service \
  --cluster "${ECS_CLUSTER_NAME}" \
  --service "${ECS_SERVICE_NAME}" \
  --task-definition "${REGISTERED_TASK_DEF_ARN}" \
  --force-new-deployment \
  --region "${AWS_REGION}"

if [ $? -ne 0 ]; then
  echo "Error: Failed to update ECS service ${ECS_SERVICE_NAME}." >&2
  exit 1
fi

echo "ECS service update initiated. Waiting for deployment to complete..."

# Wait for the service to stabilize
aws ecs wait services-stable \
  --cluster "${ECS_CLUSTER_NAME}" \
  --services "${ECS_SERVICE_NAME}" \
  --region "${AWS_REGION}"

if [ $? -ne 0 ]; then
  echo "Error: ECS service ${ECS_SERVICE_NAME} did not stabilize." >&2
  exit 1
fi

echo "Deployment to staging environment completed successfully!"
