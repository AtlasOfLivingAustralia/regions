package au.org.ala.regions

import grails.boot.GrailsApp
import grails.boot.config.GrailsAutoConfiguration
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean
import org.springframework.context.EnvironmentAware
import org.springframework.core.env.Environment
import org.springframework.core.env.MapPropertySource
import org.springframework.core.env.PropertiesPropertySource
import org.springframework.core.io.FileSystemResource

class Application extends GrailsAutoConfiguration implements EnvironmentAware {
    static void main(String[] args) {
        GrailsApp.run(Application, args)
    }

    @Override
    void setEnvironment(Environment environment) {
        def appName = environment.getProperty("info.app.name")
        def ENV_NAME = "${appName.toUpperCase()}_CONFIG"

        def default_config = ["/data/${appName}/config/${appName}-config.properties",
                              "/data/${appName}/config/${appName}-config.groovy",
                              "/data/${appName}/config/${appName}-config.yml"]

        def loc = ''

        if (System.getenv(ENV_NAME) && new File(System.getenv(ENV_NAME)).exists()) {
            loc = System.getenv(ENV_NAME)
        } else if (System.getProperty(ENV_NAME) && new File(System.getProperty(ENV_NAME)).exists()) {
            loc = System.getProperty(ENV_NAME)
        } else {
            default_config.each {
                if (!loc && new File(it).exists()) {
                    loc = it
                }
            }
        }
        if (!loc) {
            println "[${appName}] No external configuration file defined."
        } else {
            println "[${appName}] (*) grails.config.location = ${loc}"
        }

        if (loc) {
            if (loc.endsWith('.properties')) {
                Properties properties = new Properties()
                FileReader fr = new FileReader(loc)
                properties.load(fr)
                environment.propertySources.addFirst(new PropertiesPropertySource(ENV_NAME, properties))

            } else if (loc.endsWith('.groovy')) {
                def config = new ConfigSlurper().parse(new File(loc).toURI().toURL())

                environment.propertySources.addFirst(new MapPropertySource(ENV_NAME, config))
            } else if (loc.endsWith('.yml')) {
                YamlPropertiesFactoryBean ypfb = new YamlPropertiesFactoryBean()
                ypfb.setResources(new FileSystemResource(loc))

                environment.propertySources.addFirst(new MapPropertySource(ENV_NAME, ypfb.properties))
            }
        }

        //set CAS appServerName and contextPath from grails.serverURL
        if (!environment.getProperty("security.cas.appServerName")) {
            def url = new URL(environment.getProperty("grails.serverURL"))
            StringBuilder result = new StringBuilder()
            result.append(url.protocol)
            result.append(":")
            if (url.authority != null && url.authority.length() > 0) {
                result.append("//")
                result.append(url.authority)
            }

            if (url.file != null) {
                result.append(url.file)
            }

            Properties properties = new Properties()
            properties.put('security.cas.appServerName', result.toString())
            environment.propertySources.addFirst(new PropertiesPropertySource(ENV_NAME + "cas", properties))
        }
    }
}