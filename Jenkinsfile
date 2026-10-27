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
                    // Cấp đường dẫn cache chuẩn trong /tmp cho npm và electron-builder
                    docker.image('electronuserland/builder:wine').inside('-e npm_config_cache=/tmp/.npm -e XDG_CACHE_HOME=/tmp/.cache -e ELECTRON_BUILDER_CACHE=/tmp/.cache/electron-builder') {
                        // 1. Dọn dẹp node_modules cũ
                        sh 'rm -rf node_modules'
                        
                        // 2. Cài đặt phụ thuộc
                        sh 'npm ci'
                        
                        // 3. Chạy test nếu có
                        sh 'npm run --if-present test'
                        
                        // 4. Build Vite frontend bundle
                        sh 'npm run build'
                        
                        // 5. Đóng gói app Electron cho Linux & Windows
                        sh 'npx electron-builder --linux --windows'
                    }
                }
            }
        }

        stage('Publish Artifacts') {
            steps {
                // Đưa các file đóng gói đầu ra lên Jenkins Artifacts
                archiveArtifacts artifacts: 'release/*.deb, release/*.AppImage, release/*.exe, release/*.zip, dist/*.deb, dist/*.exe', allowEmptyArchive: true
            }
        }
    }
}