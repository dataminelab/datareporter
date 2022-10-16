def kustomizeAndDeploy(overlay, cluster, imageNames) {
    echo "Applying kustomize"
    sh("cd kubernetes/base && \
        /usr/local/bin/kustomize edit add resource service.yaml && \
        /usr/local/bin/kustomize edit add resource hpa.yaml && \
        cd -"
    )
    for (imageName in imageNames) {
        echo "Setting image: ${imageName}"
        sh("cd kubernetes/overlays/${overlay} && \
            /usr/local/bin/kustomize edit set image ${imageName} && cd -")
    }
    echo "Deploying"
    sh("kubectl config get-contexts")
    sh("/usr/local/bin/kustomize build kubernetes/overlays/${overlay} | kubectl --context=${cluster} --namespace=${overlay} apply -f -")
}

node {

    checkout scm

    properties([
        parameters([
            booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy this branch to staging'),
            booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip unit and integration tests')
        ])
    ])

    def appName = 'datareporter/datareporter'
    def appNginxName = 'datareporter/nginx'
    def appPlywoodServerName = 'datareporter/plywood-server'
    def registryRegion = 'eu.gcr.io'
    def cluster = 'do-fra1-k8s-1-24-4-do-0-fra1-1665788974923'
    def imageNames = []

    sh("git fetch --tags origin")

    sh("docker --version")

    def shortCommit = sh(returnStdout: true, script: "git rev-parse --short=8 HEAD").trim()
    def latestTagRelease = sh(returnStdout: true, script: "git describe --tags \$(git rev-list --tags --max-count=1) || echo 0.0.0").trim()

    def imageLabel = "\
    --label branch=${env.BRANCH_NAME} \
    --label git_sha=${shortCommit} \
    --label build_id=${env.BUILD_ID} \
    "
    def buildArgs = "--build-arg skip_dev_deps=true --build-arg APP_VERSION='${latestTagRelease}-${shortCommit}'"

    docker.withRegistry("https://${registryRegion}/", "gcr:datareporter") {

        stage("Build DR docker image",) {
            def imageNameDr = "${registryRegion}/${appName}:${latestTagRelease}-${shortCommit}"
            echo "Build docker image for: ${appName}"

            dockerimageDr = docker.build("${appName}", "${imageLabel} ${buildArgs} .")
            imageNames.add("${registryRegion}/${appName}=" + imageNameDr)
        }

        stage("Run tests") {
            sh("docker-compose build")
            if (params.SKIP_TESTS == false) {
                lock("tests"){
                    sh("docker-compose up -d postgres")
                    try{
                        retry(5){
                            sh("docker-compose run --rm postgres psql -h postgres -U postgres -c \"DROP DATABASE IF EXISTS tests\"")
                        }
                        sh("docker-compose run --rm postgres psql -h postgres -U postgres -c \"CREATE DATABASE tests\"")
                        sh("mkdir -p ./logs && touch ./logs/results.xml && chmod 666 ./logs/results.xml")
                        sh("docker-compose run server tests --junitxml=/app/logs/results.xml")
                        sh("find . -name *.xml")
                        junit allowEmptyResults: true, skipPublishingChecks: true, testResults: './logs/results.xml'
                    } finally {
                        sh("docker-compose down")
                    }
                }
            }
        }

        stage("Push DR docker image") {

            def imageTags = []
            imageTags.add("${latestTagRelease}-${shortCommit}")
            imageTags.add("${shortCommit}_${env.BUILD_ID}")
            imageTags.add("${env.BRANCH_NAME}".replaceAll("/", "."))

            for (tag in imageTags) {
                echo("Pushing docker image for ${appName} with tag ${tag}")
                dockerimageDr.push(tag)
            }
        }

        stage("Build plywood-server docker image",) {
            echo "Build docker image for: ${appPlywoodServerName}"
            def imageNamePlywoodServer = "${registryRegion}/${appPlywoodServerName}:${latestTagRelease}-${shortCommit}"

            dockerimagePlywoodServer = docker.build("${appPlywoodServerName}", "${imageLabel} ${buildArgs} plywood/server")
            imageNames.add("${registryRegion}/${appPlywoodServerName}=" + imageNamePlywoodServer)
        }

        stage("Push plywood-server docker image") {

            def imageTags = []
            imageTags.add("${latestTagRelease}-${shortCommit}")
            imageTags.add("${shortCommit}_${env.BUILD_ID}")
            imageTags.add("${env.BRANCH_NAME}".replaceAll("/", "."))

            for (tag in imageTags) {
                echo("Pushing docker image for ${appPlywoodServerName} with tag ${tag}")
                dockerimagePlywoodServer.push(tag)
            }
        }

        stage("Build Nginx docker image",) {
            echo "Build docker image for: ${appNginxName}"
            def imageNameNginx = "${registryRegion}/${appNginxName}:${latestTagRelease}-${shortCommit}"

            dockerimageNginx = docker.build("${appNginxName}", "${imageLabel} ${buildArgs} nginx")
            imageNames.add("${registryRegion}/${appNginxName}=" + imageNameNginx)
        }

        stage("Push Nginx docker image") {

            def imageTags = []
            imageTags.add("${latestTagRelease}-${shortCommit}")
            imageTags.add("${shortCommit}_${env.BUILD_ID}")
            imageTags.add("${env.BRANCH_NAME}".replaceAll("/", "."))

            for (tag in imageTags) {
                echo("Pushing docker image for ${appNginxName} with tag ${tag}")
                dockerimageNginx.push(tag)
            }
        }
    }

    stage("Deploy") {
        switch (env.BRANCH_NAME) {

          case [ 'master' ]:
            kustomizeAndDeploy("prod", cluster, imageNames)
            break

          case [ 'develop' ]:
            kustomizeAndDeploy("staging", cluster, imageNames)
            break

          default:
            if (params.DEPLOY == true) {
                echo "Deploying because user choose manual release"
                kustomizeAndDeploy("staging", cluster, imageNames)
            } else {
                echo "Only master and develop are deployed. ${env.BRANCH_NAME} is not"
            }
            break
        }
    }

}
