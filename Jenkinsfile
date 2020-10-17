node {

    checkout scm

    def appName = 'datareporter/datareporter'
    def registryRegion = 'eu.gcr.io'
    def cluster = 'k8s-1-18-8-do-1-fra1'

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

        stage("Build docker image",) {
            echo "Build docker image for: ${appName}"

            dockerimage = docker.build("${appName}", "${imageLabel} ${buildArgs} .")
        }

        stage("Push docker image") {

            def imageTags = []
            imageTags.add("${latestTagRelease}-${shortCommit}")
            imageTags.add("${shortCommit}_${env.BUILD_ID}")
            imageTags.add("${env.BRANCH_NAME}".replaceAll("/", "."))

            for (tag in imageTags) {
                echo("Pushing docker image for ${appName} with tag ${tag}")
                dockerimage.push(tag)
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
            sh("kubectl --context ${cluster} --namespace=staging apply -f ./kubernetes")
            break
  
          default:
            echo "Only master and develop are deployed. ${env.BRANCH_NAME} is not"
            break
        }
    }

}