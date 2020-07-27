import au.org.ala.regions.CustomResourceBundleMessageSource

beans = {

    messageSource(CustomResourceBundleMessageSource) {
         basenames = [
                 // using ala-i18n:
                 "file:///var/opt/atlas/i18n/regions/messages",
                 "file:///opt/atlas/i18n/regions/messages",
                 // grails-app/i18n development and production:
                 "file:grails-app/i18n/messages",
                 "file:WEB-INF/classes/messages",
                 "classpath:messages"
        ] as String[]
        fallbackToSystemLocale = false
        cacheSeconds = (60 * 60 * 6) // 6 hours
        useCodeAsDefaultMessage = false
    }
}