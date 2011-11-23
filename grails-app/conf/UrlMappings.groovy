class UrlMappings {

	static mappings = {

        "/$regionType/$regionName" (controller: 'regions', action: 'region') {
            constraints {
                regionType(inList:['states','lgas','ibras','imcras','nrms','layer'])
            }
        }
        
        "/$regionType" (controller: 'regions', action: 'regions') {
            constraints {
                regionType(inList:['states','lgas','ibras','imcras','nrms','layer'])
            }
        }

		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

		"/"(controller: 'regions')
		"500"(view:'/error')
	}
}
