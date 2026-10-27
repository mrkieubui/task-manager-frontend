pipeline {
    agent any

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Package') {
            steps {
                script {
                    docker.image('node:22-alpine').inside {
                        sh 'npm ci'
                        sh 'npm run build'
                        sh 'npm run dist'
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'release/*.*, dist/*.*', allowEmptyArchive: true
        }
    }
}