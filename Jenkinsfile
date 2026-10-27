pipeline {
    agent any

    tools {
        // Tên tool trùng khớp với tên đã tạo ở Bước 2
        nodejs 'NodeJS-22'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build Frontend Assets') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Package Electron App') {
            steps {
                sh 'npm run dist'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'release/*.*, dist/*.*', allowEmptyArchive: true
        }
    }
}