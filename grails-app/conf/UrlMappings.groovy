class UrlMappings {

	static mappings = {

        "/$regionType/$regionName" (controller: 'regions', action: 'region') {
            constraints {
                regionType(inList:['states','lgas','ibras','imcras','nrms','ipa_7aug13','ilua','layer'])
            }
        }
        
        "/$regionType" (controller: 'regions', action: 'regions') {
            constraints {
                regionType(inList:['states','lgas','ibras','imcras','nrms','ipa_7aug13', 'ilua','layer'])
            }
        }

		"/$controller/$action?/$id?(.$format)?"{
			constraints {
				// apply constraints here
			}
		}

		"/"(controller: 'regions')
		"500"(view:'/error')
	}
}
