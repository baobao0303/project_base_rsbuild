pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    parameters {
        choice(name: 'APP_ENV', choices: ['staging', 'qa', 'production', 'development'], description: 'Target build environment')
        string(name: 'IMAGE_NAME', defaultValue: 'project-base-rsbuild', description: 'Docker Image repository name')
        string(name: 'IMAGE_TAG', defaultValue: 'staging-latest', description: 'Docker Image tag')
        string(name: 'HOST_PORT', defaultValue: '4200', description: 'Host exposed HTTP port')
    }

    environment {
        CONTAINER_NAME = "rsbuild-mfe-${params.APP_ENV}"
    }

    stages {
        stage('1. Checkout Source') {
            steps {
                checkout scm
                echo "✓ Checked out branch for environment: ${params.APP_ENV}"
            }
        }

        stage('2. Build Staging Docker Image with Rsbuild') {
            steps {
                sh """
                    set -e
                    echo "=== Building Docker Image with Rsbuild (APP_ENV=${params.APP_ENV}) ==="
                    docker build \
                        --build-arg APP_ENV=${params.APP_ENV} \
                        -t ${params.IMAGE_NAME}:${params.IMAGE_TAG} \
                        -f Dockerfile .
                    echo "✓ Docker image built successfully: ${params.IMAGE_NAME}:${params.IMAGE_TAG}"
                """
            }
        }

        stage('3. Deploy Staging Container') {
            steps {
                sh """
                    set -e
                    echo "=== Deploying container ${CONTAINER_NAME} on port ${params.HOST_PORT} ==="
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        -p ${params.HOST_PORT}:80 \
                        ${params.IMAGE_NAME}:${params.IMAGE_TAG}
                    echo "✓ Container ${CONTAINER_NAME} started on http://localhost:${params.HOST_PORT}"
                """
            }
        }

        stage('4. Smoke Test & Health Check') {
            steps {
                sh """
                    set -e
                    echo "=== Verifying NGINX and Micro-Frontend availability ==="
                    sleep 3
                    curl -fsS "http://127.0.0.1:${params.HOST_PORT}/healthz"
                    echo "✓ Healthcheck /healthz passed"
                    curl -fsS "http://127.0.0.1:${params.HOST_PORT}/" | head -n 5
                    echo "✓ Host Shell is accessible"
                """
            }
        }
    }

    post {
        always {
            cleanWs notFailBuild: true
        }
        success {
            echo "🎉 Jenkins Staging Build & Deploy completed successfully!"
        }
        failure {
            echo "❌ Jenkins Pipeline failed."
        }
    }
}
