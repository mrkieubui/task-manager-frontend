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
                    // Dùng image builder chuẩn có sẵn glibc, wine và 7za
                    docker.image('electronuserland/builder:wine').inside('-e npm_config_cache=/tmp/.npm -e XDG_CACHE_HOME=/tmp/.cache -e ELECTRON_BUILDER_CACHE=/tmp/.cache/electron-builder') {
                        // 1. Cài đặt các gói phụ thuộc
                        sh 'npm ci'
                        
                        // 2. Chạy lệnh build và dist đóng gói
                        sh 'npm run dist'
                    }
                }
            }
        }
    }

    post {
        always {
            // Lưu trữ các file sản phẩm đóng gói (.deb, .AppImage, .exe)
            archiveArtifacts artifacts: 'release/*.*, dist/*.*', allowEmptyArchive: true
        }
    }
}