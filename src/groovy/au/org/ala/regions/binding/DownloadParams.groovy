package au.org.ala.regions.binding

import grails.validation.Validateable

/**
 * Created by rui008 on 10/02/15.
 */
@Validateable
class DownloadParams {

    String email, fileName, downloadReason, downloadOption

    static constraints = {
        email(blank: false, nullable: false, email: true)
        fileName(blank: false, nullable: false)
        downloadReason(blank: false, nullable: false)
        downloadOption(blank: false, nullable: false)
    }
}
