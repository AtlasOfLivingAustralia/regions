package au.org.ala.regions

/**
 * Expose all messages.properties for jquery.i18n.properties
 */
class MessagesController {

    def messageSource

    static defaultAction = "i18n"

    def i18n(String id) {
        response.setHeader("Content-type", "text/plain; charset=UTF-8")
        response.setCharacterEncoding("UTF-8")
        Locale locale = request.locale

        if (id && id.startsWith("messages_")) {
            // Assume standard messageSource file name pattern:
            // messages.properties, messages_en.properties, messages_en_US.properties
            String locale_suffix = id.replaceFirst(/messages_(.*)/,'$1')
            List locBits = locale_suffix?.tokenize('_')
            locale = new Locale(locBits[0], locBits[1]?:'')
        }

        Properties props = messageSource.listMessageCodes(locale?:request.locale)
        log.debug "message source properties size = ${props.size()}"
        List messages = props.collect{ new String("${it.key}=${it.value}".getBytes("UTF-8"), "UTF-8") }

        render ( text: messages.sort().join("\n") )
    }
}
