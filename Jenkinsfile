pipeline {
    agent any

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Test') {
            steps {
                script {
                    // Đổi sang node:22-alpine để tương thích với Electron 45 & Vite 8
                    docker.image('node:22-alpine').inside {
                        sh 'npm ci'
                        // Bỏ qua step test nếu package.json chưa viết test suite
                        // Hoặc dùng lệnh kiểm tra an toàn:
                        sh 'npm run --if-present test'
                    }
                }
            }
        }

        stage('Build & Package Electron App') {
            steps {
                script {
                    // Sử dụng image builder hỗ trợ đóng gói ứng dụng Electron cho Linux/Windows
                    docker.image('electronuserland/builder:wine').inside {
                        sh 'npm run build || npm run make'
                    }
                }
            }
        }

        stage('Publish Artifacts') {
            steps {
                // Lưu trữ file bộ cài (.deb, .AppImage, .exe) trên Jenkins Server
                archiveArtifacts artifacts: 'dist/*.deb, dist/*.AppImage, release/*.deb', allowEmptyArchive: true
            }
        }
    }
}