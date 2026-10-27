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
                    docker.image('electronuserland/builder:wine').inside('-e npm_config_cache=/tmp/.npm -e XDG_CACHE_HOME=/tmp/.cache -e ELECTRON_BUILDER_CACHE=/tmp/.cache/electron-builder') {
                        // 1. Cài đặt dependencies
                        sh 'npm ci'
                        
                        // 2. Build Vite Frontend Asset
                        sh 'npm run build'
                        
                        // 3. Đóng gói app và TẮT tính năng tự động publish lên GitHub
                        sh 'npx electron-builder --linux --publish never'
                    }
                }
            }
        }
    }

    post {
        always {
            // Lưu trữ file cài đặt (.deb) thu được vào Jenkins Artifacts
            archiveArtifacts artifacts: 'release/*.deb', allowEmptyArchive: true
        }
    }
}