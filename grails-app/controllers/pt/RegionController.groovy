package pt

class RegionController {

    static defaultAction = 'regions3'

    /**
     * Display the top-level regions page.
     */
    def regions = {
        [initialDisplay:'GER']
    }

    def regions2 = {}
    
    def regions3 = {}

    def test = {}
    def test2 = {}

    def region = {
        def region = params.regionName ?: 'South Australia'
        [region: [name:region], regionType: params.regionType]
    }
}
