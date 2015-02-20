package au.org.ala.regions

import spock.lang.Specification

/**
 * Created by rui008 on 4/02/2015.
 */
class TestsSpec extends Specification {

    void "test replace all"() {
        when:
        String name = "Marsupials, Dasyuroid & Carnivores"
        String newName = name.replaceAll(/[^A-Za-z\\d]/, "")
        println newName
        then:
        newName == "MarsupialsDasyuroidCarnivores"
    }
}
