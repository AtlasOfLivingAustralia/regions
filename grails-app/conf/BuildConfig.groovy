import grails.util.Environment

grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.target.level = 1.7
grails.project.source.level = 1.7
grails.project.war.file = "target/${appName}-${appVersion}.war"
grails.project.groupId = "au.org.ala"

grails.project.dependency.resolver = "maven"

grails.plugin.location."ajaxanywhere" = "../../aruizca/AjaxAnywhere-grails-plugin"

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
        compile 'org.codehaus.groovy.modules.http-builder:http-builder:0.7.1'
    }

    plugins {
        build ":tomcat:7.0.54"
        build (":release:3.0.1") {
            exclude "rest-client-builder"
        }

        compile ":font-awesome-resources:4.2.0.0"

        runtime (":ala-bootstrap2:1.0-SNAPSHOT") {
            exclude "jquery"
        }
    }
}
