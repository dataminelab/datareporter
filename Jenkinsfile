def kustomizeAndDeploy(overlay, cluster, imageNames) {
    echo "Applying kustomize"
    sh("pushd kubernetes/base && \
        /usr/local/bin/kustomize edit add resource service.yaml; && \
        /usr/local/bin/kustomize edit add resource hpa.yaml; && \
        popd"
    )
    for (imageName in imageNames) {
        echo "Setting imagetag: ${imageName}"
        sh("pushd kubernetes/overlays/${overlay} && \
            /usr/local/bin/kustomize edit set imagetag ${imageName} && popd")
    }
    echo "Deploying"
    sh("/usr/local/bin/kustomize build kubernetes/overlays/${overlay} | kubectl --context=${cluster} --namespace=${overlay} apply -f -")
}

node {

    checkout scm

    def appName = 'datareporter/datareporter'
    def appNginxName = 'datareporter/nginx'
    def registryRegion = 'eu.gcr.io'
    def cluster = 'do-fra1-k8s-1-18-8-do-1-fra1'
    def imageNames = []

    sh("git fetch --tags origin")

    sh("docker --version")

    def shortCommit = sh(returnStdout: true, script: 'git rev-parse --short=8 HEAD').trim()
    def latestTagRelease = sh(returnStdout: true, script: "git describe --tags \$(git rev-list --tags --max-count=1) || echo 0.0.0").trim()

    def imageLabel = "\
    --label branch=${env.BRANCH_NAME} \
    --label git_sha=${shortCommit} \
    --label build_id=${env.BUILD_ID} \
    "
    def buildArgs = "--build-arg APP_VERSION='${latestTagRelease}-${shortCommit}'"

    def imageName = "${registryRegion}/${appName}:${latestTagRelease}-${shortCommit}"

    docker.withRegistry("https://${registryRegion}/", "gcr:datareporter") {

        stage("Build DR docker image",) {
            echo "Build docker image for: ${appName}"

            dockerimageDr = docker.build("${appName}", "${imageLabel} ${buildArgs} .")
            imageNames.add(dockerimageDr)
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

        stage("Build Nginx docker image",) {
            echo "Build docker image for: ${appNginxName}"

            dockerimageNginx = docker.build("${appNginxName}", "${imageLabel} ${buildArgs} nginx")
            imageNames.add(dockerimageNginx)
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
          
        // TODO: add livespace namespace
        //   case [ 'master' ]:
        //     sh("kubectl --context ${cluster} --namespace=live apply -f ./kubernetes")
        //     break
          
          case [ 'develop' ]:
          case [ 'k8s' ]: // For testing
            // sh("kubectl --context ${cluster} --namespace=staging apply -f ./kubernetes")
            kustomizeAndDeploy("staging", cluster, imageNames)
            break
  
          default:
            echo "Only master and develop are deployed. ${env.BRANCH_NAME} is not"
            break
        }
    }

}