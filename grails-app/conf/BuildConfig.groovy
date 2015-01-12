import grails.util.Environment

grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.war.file = "target/${appName}-${appVersion}.war"
grails.project.groupId = "au.org.ala"

grails.project.dependency.resolver = "maven"

grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // uncomment to disable ehcache
        // excludes 'ehcache'
    }
    log "warn" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    repositories {
        mavenLocal()
        mavenRepo ("http://nexus.ala.org.au/content/groups/public/") {
            updatePolicy 'always'
        }
    }
    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes eg.

        compile "au.org.ala:ala-cas-client:2.1-SNAPSHOT"
    }

    plugins {
        build ":tomcat:7.0.54"
        build ":release:3.0.1"

        compile ":font-awesome-resources:4.2.0.0"


        runtime ':resources:1.2.8'
        if (Environment.current == Environment.PRODUCTION) {
            runtime ":zipped-resources:1.0"
            runtime ":yui-minify-resources:0.1.5"
        }

        runtime (":ala-web-theme:0.8.5") {
            exclude "svn"
            exclude "cache"
            exclude "cache-ehcache"
            exclude "jquery"
        }
    }
}
