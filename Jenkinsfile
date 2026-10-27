pipeline {
    agent any

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Cài đặt các gói phụ thuộc
                sh 'npm ci'
            }
        }

        stage('Build Frontend Assets') {
            steps {
                // Biên dịch giao diện (Vite/React/Vue...)
                sh 'npm run build'
            }
        }

        stage('Package Electron App') {
            steps {
                // Đóng gói ứng dụng Desktop bằng npm run dist
                sh 'npm run dist'
            }
        }
    }

    post {
        always {
            // Lưu các file cài đặt đầu ra (.deb, .AppImage, .exe) trên Jenkins
            archiveArtifacts artifacts: 'release/*.*, dist/*.*', allowEmptyArchive: true
        }
    }
}