class UrlMappings {

	static mappings = {

        "/$regionType/$regionName?" (controller: 'region', action: 'region') {
            constraints {
                regionType(inList:['states','lgas','ibras','imcras','nrms'])
            }
        }
        
		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

		"/"(view:"/index")
		"500"(view:'/error')
	}
}
