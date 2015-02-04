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

        compile "au.org.ala:ala-cas-client:2.1-SNAPSHOT"
        compile 'com.yahoo.platform.yui:yuicompressor:2.4.8'

        /* WebJars */
        compile 'org.webjars:jquery:1.11.2'
        compile 'org.webjars:jquery-ui:1.11.2'
        compile 'org.webjars:jquery-ui-themes:1.11.2'
    }

    plugins {
        build ":tomcat:7.0.54"
        build (":release:3.0.1") {
            exclude "rest-client-builder"
        }
        build ":modules-manager:0.2.2-SNAPSHOT"

        compile ":font-awesome-resources:4.2.0.0"

        runtime ':resources:1.2.14'
        if (Environment.current == Environment.PRODUCTION) {
            runtime ":zipped-resources:1.0.1"
            runtime ":cached-resources:1.1"
            compile ":cache-headers:1.1.7"
            runtime ":yui-minify-resources:0.1.5"
        }

        runtime (":ala-web-theme:0.8.5") {
            exclude "svn"
            exclude "cache"
            exclude "cache-ehcache"
            exclude "jquery"
            exclude "rest"
        }

        runtime ":jquery:1.7.2"
    }
}
