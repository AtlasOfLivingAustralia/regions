beans = {
    messageSource(org.grails.spring.context.support.ReloadableResourceBundleMessageSource) {
         basenames = [
                 // using ala-i18n:
                 "file:///var/opt/atlas/i18n/regions/messages",
                 "file:///opt/atlas/i18n/regions/messages",
                 // grails-app/i18n development and production:
                 "file:grails-app/i18n/messages",
                 "WEB-INF/grails-app/i18n/messages",
                 "classpath:messages"
        ] as String[]
        cacheSeconds = (60 * 60 * 6) // 6 hours
        useCodeAsDefaultMessage = false
    }
}