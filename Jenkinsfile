pipeline {
    agent any

    environment {
        // Cấu hình các token để tự động publish release nếu cần (ví dụ: GitHub Token)
        GH_TOKEN = credentials('github-release-token')
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Test') {
            steps {
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'npm ci'
                        sh 'npm test -- --passWithNoTests'
                    }
                }
            }
        }

        stage('Build & Package Electron App') {
            steps {
                script {
                    // Sử dụng electron-builder hoặc electron-packager để build ra bộ cài
                    // Lưu ý: Build file .exe cần môi trường Windows Agent hoặc Wine trên Linux Agent
                    docker.image('electronuserland/builder:wine').inside {
                        sh 'npm run dev' // hoặc 'npx electron-builder --win --linux'
                    }
                }
            }
        }

        stage('Publish Artifacts') {
            steps {
                echo '=== Lưu trữ file bộ cài (.exe, .dmg, .AppImage) lên Jenkins hoặc Storage Server ==='
                // Lưu file đầu ra trên Jenkins để tải về
                archiveArtifacts artifacts: 'dist/*.exe, dist/*.AppImage', allowEmptyArchive: false
            }
        }
    }
}