// locations to search for config files that get merged into the main config
// config files can either be Java properties files or ConfigSlurper scripts

// grails.config.locations = [ "classpath:${appName}-config.properties",
//                             "classpath:${appName}-config.groovy",
//                             "file:${userHome}/.grails/${appName}-config.properties",
//                             "file:${userHome}/.grails/${appName}-config.groovy"]

// if(System.properties["${appName}.config.location"]) {
//    grails.config.locations << "file:" + System.properties["${appName}.config.location"]
// }

/******************************************************************************\
 *  CONFIG MANAGEMENT
 \******************************************************************************/
def ENV_NAME = "REGIONS_CONFIG"
def default_config = "/data/regions/config/${appName}-config.properties"
if(!grails.config.locations || !(grails.config.locations instanceof List)) {
    grails.config.locations = []
}
if(System.getenv(ENV_NAME) && new File(System.getenv(ENV_NAME)).exists()) {
    println "[REGIONS] Including configuration file specified in environment: " + System.getenv(ENV_NAME);
    grails.config.locations = ["file:" + System.getenv(ENV_NAME)]
} else if(System.getProperty(ENV_NAME) && new File(System.getProperty(ENV_NAME)).exists()) {
    println "[REGIONS] Including configuration file specified on command line: " + System.getProperty(ENV_NAME);
    grails.config.locations = ["file:" + System.getProperty(ENV_NAME)]
} else if(new File(default_config).exists()) {
    println "[REGIONS] Including default configuration file: " + default_config;
    def loc = ["file:" + default_config]
    println "[REGIONS] >> loc = " + loc
    grails.config.locations = loc
    println "[REGIONS]  grails.config.locations = " + grails.config.locations
} else {
    println "[REGIONS] No external configuration file defined."
}
println "[REGIONS]  (*) grails.config.locations = ${grails.config.locations}"

/******************************************************************************\
 *  RELOADABLE CONFIG
 \******************************************************************************/
//reloadable.cfgPollingFrequency = 1000 * 60 * 60 // 1 hour
//reloadable.cfgPollingRetryAttempts = 5
reloadable.cfgs = ["file:/data/regions/config/regions-config.properties"]

/******************************************************************************\
 *  SKINNING
\******************************************************************************/
if (!ala.skin) {
    ala.skin = 'ala2';
}
/*if (!ala.skin.loginoutLinkTag.method) {
    ala.skin.loginoutLinkTag.method = "buildLoginoutLink"
}
if (!ala.skin.loginoutLinkTag.clazz) {
    ala.skin.loginoutLinkTag.clazz = "RegionsTagLib"
}*/
/******************************************************************************\
 *  EXTERNAL SERVERS
\******************************************************************************/
if (!bie.baseURL) {
     bie.baseURL = "http://bie.ala.org.au"
}
if (!bie.searchPath) {
     bie.searchPath = "/search"
}
if (!biocache.baseURL) {
     biocache.baseURL = "http://biocache.ala.org.au/"
}
if (!spatial.baseURL) {
     spatial.baseURL = "http://spatial.ala.org.au/"
}
if (!ala.baseURL) {
    ala.baseURL = "http://www.ala.org.au"
}
if (!headerAndFooter.baseURL) {
    headerAndFooter.baseURL = "http://www2.ala.org.au/commonui"
}
// spatial services
if (!spatial.wms.url) {
    spatial.wms.url = spatial.baseURL + "geoserver/ALA/wms?"
}
if (!spatial.wms.cache.url) {
    spatial.wms.cache.url = spatial.baseURL + "geoserver/gwc/service/wms?"
}
if (!spatial.layers.service.url) {
    spatial.layers.service.url = spatial.baseURL + "layers-service"
}

/******************************************************************************\
 *  SECURITY
 \******************************************************************************/
if (!security.cas.urlPattern) {
    security.cas.urlPattern = ""
}
if (!security.cas.loginUrl) {
    security.cas.loginUrl = "https://auth.ala.org.au/cas/login"
}
if (!security.cas.logoutUrl) {
    security.cas.logoutUrl = "https://auth.ala.org.au/cas/logout"
}

grails.project.groupId = appName // change this to alter the default package name and Maven publishing destination
grails.mime.file.extensions = true // enables the parsing of file extensions from URLs into the request format
grails.mime.use.accept.header = false
grails.mime.types = [ html: ['text/html','application/xhtml+xml'],
                      xml: ['text/xml', 'application/xml'],
                      text: 'text/plain',
                      js: 'text/javascript',
                      rss: 'application/rss+xml',
                      atom: 'application/atom+xml',
                      css: 'text/css',
                      csv: 'text/csv',
                      all: '*/*',
                      json: ['application/json','text/json'],
                      form: 'application/x-www-form-urlencoded',
                      multipartForm: 'multipart/form-data'
                    ]

// URL Mapping Cache Max Size, defaults to 5000
//grails.urlmapping.cache.maxsize = 1000

// The default codec used to encode data with ${}
grails.views.default.codec = "none" // none, html, base64
grails.views.gsp.encoding = "UTF-8"
grails.converters.encoding = "UTF-8"
// enable Sitemesh preprocessing of GSP pages
grails.views.gsp.sitemesh.preprocess = true
// scaffolding templates configuration
grails.scaffolding.templates.domainSuffix = 'Instance'

// Set to false to use the new Grails 1.2 JSONBuilder in the render method
grails.json.legacy.builder = false
// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true
// whether to install the java.util.logging bridge for sl4j. Disable for AppEngine!
grails.logging.jul.usebridge = true
// packages to include in Spring bean scanning
grails.spring.bean.packages = []

// request parameters to mask when logging exceptions
grails.exceptionresolver.params.exclude = ['password']

// set per-environment serverURL stem for creating absolute links
environments {
    production {
        if (!grails.serverURL) {
            grails.serverURL = "http://regions.ala.org.au"
        }
        security.cas.serverName = grails.serverURL
    }
    development {
        grails.hostName = "localhost:8080"
        //grails.hostName = "woodfired.ala.org.au:8080"
        grails.serverURL = "http://${grails.hostName}/${appName}"
        security.cas.serverName = "http://${grails.hostName}"
    }
    test {
        grails.serverURL = "http://localhost:8080/${appName}"
    }

}

logging.dir = (System.getProperty('catalina.base') ? System.getProperty('catalina.base') + '/logs' : '/var/log/tomcat7')
// log4j configuration
log4j = {
// Example of changing the log pattern for the default console
// appender:
    appenders {
        environments {
            production {
                rollingFile name: "tomcatLog", maxFileSize: 102400000, file: logging.dir + "/dashboard.log", threshold: org.apache.log4j.Level.ERROR, layout: pattern(conversionPattern: "%d %-5p [%c{1}] %m%n")
                'null' name: "stacktrace"
            }
            development {
                console name: "stdout", layout: pattern(conversionPattern: "%d %-5p [%c{1}] %m%n"), threshold: org.apache.log4j.Level.DEBUG
            }
            test {
                rollingFile name: "tomcatLog", maxFileSize: 102400000, file: "/tmp/dashboard-test.log", threshold: org.apache.log4j.Level.DEBUG, layout: pattern(conversionPattern: "%d %-5p [%c{1}] %m%n")
                'null' name: "stacktrace"
            }
        }
    }
    root {
// change the root logger to my tomcatLog file
        error 'tomcatLog'
        warn 'tomcatLog'
        additivity = true
    }

    debug 'grails.app',
            'au.org.ala.au.org.ala.regions'

}

// Uncomment and edit the following lines to start using Grails encoding & escaping improvements

/* remove this line 
// GSP settings
grails {
    views {
        gsp {
            encoding = 'UTF-8'
            htmlcodec = 'xml' // use xml escaping instead of HTML4 escaping
            codecs {
                expression = 'html' // escapes values inside null
                scriptlet = 'none' // escapes output from scriptlets in GSPs
                taglib = 'none' // escapes output from taglibs
                staticparts = 'none' // escapes output from static template parts
            }
        }
        // escapes all not-encoded output at final stage of outputting
        filteringCodecForContentType {
            //'text/html' = 'html'
        }
    }
}
remove this line */
