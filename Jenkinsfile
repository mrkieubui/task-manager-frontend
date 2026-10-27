pipeline {
    agent any

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Package Electron App') {
            steps {
                script {
                    // Chạy toàn bộ tiến trình install + build trong cùng container builder
                    docker.image('electronuserland/builder:wine').inside {
                        // 1. Cài đặt dependency trực tiếp trong môi trường glibc/wine
                        sh 'npm ci'
                        
                        // 2. Chạy test nếu có
                        sh 'npm run --if-present test'
                        
                        // 3. Build Web Assets (Vite)
                        sh 'npm run build'
                        
                        // 4. Đóng gói Electron app (dùng script electron-builder hoặc script build mặc định)
                        sh 'npx electron-builder --linux --windows'
                    }
                }
            }
        }

        stage('Publish Artifacts') {
            steps {
                // Đưa các file bộ cài đầu ra (.deb, .AppImage, .exe) lên Jenkins Artifacts
                archiveArtifacts artifacts: 'dist/*.deb, dist/*.AppImage, dist/*.exe, release/*.deb, release/*.exe', allowEmptyArchive: true
            }
        }
    }
}