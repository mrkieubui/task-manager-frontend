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
                    docker.image('electronuserland/builder:wine').inside('-e npm_config_cache=/tmp/.npm') {
                        // 1. Dọn dẹp node_modules rác từ các lượt build trước
                        sh 'rm -rf node_modules'
                        
                        // 2. Cài đặt sạch phụ thuộc
                        sh 'npm ci'
                        
                        // 3. Chạy test (nếu khai báo trong package.json)
                        sh 'npm run --if-present test'
                        
                        // 4. Build web bundle (Vite/TSC)
                        sh 'npm run build'
                        
                        // 5. Đóng gói ứng dụng Electron cho Linux & Windows
                        sh 'npx electron-builder --linux --windows'
                    }
                }
            }
        }

        stage('Publish Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/*.deb, dist/*.AppImage, dist/*.exe, release/*.deb, release/*.exe', allowEmptyArchive: true
            }
        }
    }
}