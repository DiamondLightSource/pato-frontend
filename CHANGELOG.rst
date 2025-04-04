==========
Changelog
==========

++++++++++
v1.20.1 (02/04/2025)
++++++++++

**Changed**

- Use loading icon for micrograph images
- Display warning for picked tomograms
- Display spinner to loading submit button

**Fixed**

- Cancel button on alerts form now works as expected

++++++++++
v1.20.0 (14/03/2025)
++++++++++

**Added**

- Add link to PDF report of SPA data collection

++++++++++
v1.19.1 (07/03/2025)
++++++++++

**Changed**

- Automatically redirect user to relevant data collection type

++++++++++
v1.19.0 (06/03/2025)
++++++++++

**Added**

- Display picked tomograms

**Fixed**

- Set box plot domain to always positive, non-zero numbers

++++++++++
v1.18.0 (07/02/2025)
++++++++++

**Added**

- User can toggle between displaying/hiding foil holes with no movies @gmg29649
- Foil holes with no movies get displayed in red @gmg29649
- Email alerts registration page

++++++++++
v1.17.0 (07/02/2025)
++++++++++

**Added**

- User can now display uncollected grid squares in atlas @gmg29649

**Fixed**

- Fix uncaught error on null/empty grid squares for valid atlases

++++++++++
v1.16.0 (30/01/2025)
++++++++++

**Changed**

- When a foil hole is selected, micrographs are displayed, instead of a list of movies

**Fixed**

- Sorting is correctly applied between pages when a tomogram in the list of tomograms is clicked
- Searching for a term that returns no results doesn't clear out the `search` portion of your search parameters

++++++++++
v1.15.0 (24/01/2025)
++++++++++

**Added**

- Visualisation is now available for multiple refined 3D classes

**Fixed**

- Search params now update properly when page/search/limit changes

++++++++++
v1.14.1 (17/01/2025)
++++++++++

**Fixed**

- Fix foil hole placement on square grid squares

++++++++++
v1.14.0 (16/01/2025)
++++++++++

**Added**

- Link to atlas from movie

++++++++++
v1.13.1 (10/01/2025)
++++++++++

**Changed**

- Grey out atlas button if no atlas is available
- Foil hole ID is now stored in search params

++++++++++
v1.13.0 (10/12/2024)
++++++++++

**Added**

- Add atlas grid page

**Changed**

- Add note to total dose, clarifying the dose is estimated

++++++++++
v1.12.3 (11/11/2024)
++++++++++

**Changed**

- Ignore all but least recent refinement step
- Update model upload message

++++++++++
v1.12.2 (21/10/2024)
++++++++++

**Changed**

- Ice thickness graph Y axis is now displayed in log scale

++++++++++
v1.12.1 (10/10/2024)
++++++++++

**Added**

- Move B-factor displays to refinement view

++++++++++
v1.12.0 (09/10/2024)
++++++++++

**Added**

- Add B-factor displays

++++++++++
v1.11.1 (09/09/2024)
++++++++++

**Fixed**

- Use new version of component library, use correct width/height for APNGs
- Improve graph height on smaller screens for statistics graphs

++++++++++
v1.11.0 (06/08/2024)
++++++++++

**Added**

- Include particle count per resolution/defocus values graph in collection statistics page
- Custom model upload

**Changed**

- Redirect to Sample Handling is now done through the backend

++++++++++
v1.10.2 (26/07/2024)
++++++++++

**Fixed**

- Tomogram page controller now takes up to 5 digits

++++++++++
v1.10.1 (11/07/2024)
++++++++++

**Fixed**

- Segmented denoised images no longer "jump around"

++++++++++
v1.10.0 (13/06/2024)
++++++++++

**Added**

- Isosurface slider for Molstar visualisation
- Display segmented denoised tomogram images

++++++++++
v1.9.2 (16/05/2024)
++++++++++

**Fixed**

- Enable feedback button on session page

++++++++++
v1.9.1 (16/05/2024)
++++++++++

**Fixed**

- Beta tag is now only displayed on refinement steps

++++++++++
v1.9.0 (14/05/2024)
++++++++++

**Added**

- Feedback link in footer now takes custom URLs
- Direct link to sample handling service in session page
- Refinement view
- Updated description for particle picking Images

++++++++++
v1.8.2 (08/04/2024)
++++++++++

**Changed**

- Temporary workaround, filter SPA refinement step in processing jobs

++++++++++
v1.8.1 (08/04/2024)
++++++++++

**Changed**

- Temporary workaround, hide SPA refinement step

++++++++++
v1.8.0 (20/03/2024)
++++++++++

**Added**

- Display angle distribution plot alongside 3D classification data

**Fixed**

- Tomogram page is now updated when sorting/filter options change
- Central slice is now larger in smaller screens

++++++++++
v1.7.1 (19/03/2024)
++++++++++

**Fixed**

- Processing job parameters are still displayed if backend returns 404
- Box size/mask diameter are both sent to the backend if form is prepopulated and unchanged


++++++++++
v1.7.0 (22/02/2024)
++++++++++

**Added**

- Particle count summary graph in SPA data collection page
- Note detailing pixel size on classifications
- Graph domain for ice thickness

++++++++++
v1.6.2 (19/02/2024)
++++++++++

**Changed**

- Improve performance of session homepage
- Tomogram/SPA pages get reloaded if new processing job is created

**Fixed**

- Fixed modal not opening in data collections without processing jobs

++++++++++
v1.6.1 (13/02/2024)
++++++++++

**Fixed**

- Cancel button on data collection creation modal
- Reprocessing check is done on a session level
- Year on footer has been updated

++++++++++
v1.6.0 (07/02/2024)
++++++++++

**Changed**

- Border is shrunk on smaller screens
- Cryolo, 2D classification, 3D classification enabled in reprocessing by default

**Added**

- Relion reprocessing form now displays autocalculated values for box size/mask diameter
- Users can now create data collections from the session page
- Users can now sort data collections by global alignment quality

**Removed**

- Downsample box size field
- Second pass fields

++++++++++
v1.5.2 (25/01/2024)
++++++++++

**Changed**

- SPA reprocessing form now performs checks for maximum and minimum diameter when not stopping after CTF estimation
- Moved output values closer to top in motion correction row
- "Calculate for Me" is ticked by default in reprocessing dialogue

**Fixed**

- Motion correction row now responds to CTF summary data clicks

++++++++++
v1.5.1 (17/01/2024)
++++++++++

**Changed**

- Reprocessing enabled

++++++++++
v1.5.0 (12/12/2023)
++++++++++

**Added**

- About page for processing information

++++++++++
v1.4.0 (12/12/2023)
++++++++++

**Added**

- Job parameter overview for processing jobs

++++++++++
v1.3.5 (27/11/2023)
++++++++++

**Changed**

- Pixel size on image is now displayed in angstroms instead of nanometres

++++++++++
v1.3.4 (16/11/2023)
++++++++++

**Changed**

- Data collection groups page now displays image directory
- Image directory is displayed in data collections rather than file templates
- 3D classification in SPA pages is displayed last

++++++++++
v1.3.3 (30/10/2023)
++++++++++

**Changed**

- Fixes display values for particles per batch, classes per batch

**Removed**

- Unused fields :code:`detector mode`, :code:`c2 lens`, :code:`first frame`, :code:`last frame`, :code:`refined magnification`, :code:`number of particles`

++++++++++
v1.3.2 (26/10/2023)
++++++++++

**Removed**

- Unused query parameter in drift plot request

++++++++++
v1.3.1 (03/10/2023)
++++++++++

**Removed**

- Unused fields :code:`numberOfImages`, :code:`frameLength`, :code:`frameDose`

++++++++++
v1.3.0 (26/09/2023)
++++++++++

**Added**

- Adds processing job step to SPA processing job list

++++++++++
v1.2.5 (12/09/2023)
++++++++++

**Changed**

- Build process improvements

++++++++++
v1.2.4 (30/08/2023)
++++++++++

**Changed**

- Fix stale images when tomograms have repeating autoprocessing program IDs

++++++++++
v1.2.3 (17/08/2023)
++++++++++

**Changed**

- Pixel size unit is now nanometres
- Estimated defocus converted from angstroms to micrometres

++++++++++
v1.2.2 (31/07/2023)
++++++++++

**Changed**

- Logout button interactive area spans entire width of menu

++++++++++
v1.2.1 (13/07/2023)
++++++++++

**Changed**

- Fix broken calendar links
- Disable reprocessing inactive visits

++++++++++
v1.2.0 (11/07/2023)
++++++++++

**Added**

- SPA reprocessing (enabled)

**Changed**

- Page changes for motion correction and tomograms are now debounced
- Fixes data collections with no file templates not appearing

++++++++++
v1.1.0 (04/07/2023)
++++++++++

**Added**

- Feedback page

**Changed**

- Common components moved to external library
- Pagination is not hidden when no pages are available

++++++++++
v1.0.1 (27/06/2023)
++++++++++

**Changed**

- Row components do not "spill" over boundaries of parent box when reducing page width

++++++++++
v1.0.0 (20/06/2023)
++++++++++

**Changed**

- Improved data decimation algorithm
- Fixes decimation case where points are needlessly omitted
- Displays message rather than ommitting whole classification row if no data is available
- Row components do not "spill" over boundaries of parent box when reducing page width

++++++++++
v1.0.0 (20/06/2023)
++++++++++

**Changed**

- Improved data decimation algorithm
- Fixes decimation case where points are needlessly omitted
- Displays message rather than ommitting whole classification row if no data is available

++++++++++
v0.14.0 (13/06/2023)
++++++++++

**Added**

- Data decimation for scatter plots

**Changed**

- Fixes starting page for motion correction
- Hides pagination if no items are available in generic table pages

++++++++++
v0.13.0 (31/05/2023)
++++++++++

**Added**

- Denoised central slices and tomograms are now displayed

**Changed**

- Fixed limit in URL being ignored

++++++++++
v0.12.1 (23/05/2023)
++++++++++

**Removed**
- Unused columns (resolution in 2D classification, refined tilt angle in SPA)

++++++++++
v0.12.0 (16/05/2023)
++++++++++

**Added**

- User can now filter out unselected classes; selected classes are displayed in green, unselected in red

++++++++++
v0.11.0 (02/05/2023)
++++++++++

**Added**

- User can page through tomograms in the movie modal
- Molstar viewer also displays slices

**Changed**

- Data collections use a single column in narrow displays

++++++++++
v0.10.1 (14/04/2023)
++++++++++

**Changed**

- Fixes auth redirection on Chrome, no orphan search parameters included
- Performance and memory usage improvements to Molstar
- Fixes empty white horizontal bar below footer on staging environments

++++++++++
v0.10.0 (13/04/2023)
++++++++++

**Added**

- Data caching
- "Beta" tag is now shown in specific deployments

**Changed**

- Breadcrumbs moved to just under navigation bar
- Homepage no longer has horizontal overflow

+++++++++
v0.9.3 (06/04/2023)
++++++++++

**Changed**

- Uses strict-mode for cookies in production

++++++++++
v0.9.2 (06/04/2023)
++++++++++

**Changed**

- API endpoints can be configured to be generated based on the current origin

++++++++++
v0.9.1 (04/04/2023)
++++++++++

**Changed**

- Fixes redundant requests for user information on page changes
- Token is now stored in cookies
- UI respects search parameters properly
- Fixes motion correction pagination in SPA when moving through records quickly
- Fixes "unavailable" message on particle picking
- Improves rendering performance for scatter plots
- Fixes "jumping" "No Data Available" message for plots

++++++++++
v0.9.0 (28/03/2023)
++++++++++

**Added**

- "Reset Camera Orientation" function for Molstar viewer
- Raw MRC file can now be downloaded

**Changed**

- Ultrawide monitors now display two columns of data in data collection pages
- Fixed menu for mobile devices

++++++++++
v0.8.0 (14/03/2023)
++++++++++

**Added**

- Adds pagination to 3D visualisation modal

**Changed**

- 3D visualisation modal does not try to render model twice
- Performance improvements to non-cached homepage
- Calendar styling improvements
- Network errors now redirect to error page

++++++++++
v0.7.0 (07/03/2023)
++++++++++

**Added**

- Calendar page completely functional
- Enabled screenshot/zoom reset buttons on 3D visualisation (SPA)

**Changed**

- Classification rows with no data no longer display skeleton for pagination

++++++++++
v0.6.1 (28/02/2023)
++++++++++

**Changed**

- Fixes rendering MRC files with non-standard content types

++++++++++
v0.6.0 (28/02/2023)
++++++++++

**Added**

- 3D visualisation of volume files for SPA
- 3D classification information

**Changed**

- Fixes inconsistencies between X overflow on Chrome and Firefox

++++++++++
v0.5.0 (21/02/2023)
++++++++++

**Added**

- Tomogram reprocessing form enabled
- Data statistics page now contains total motion, estimated resolution and particle count

++++++++++
v0.4.2 (07/02/2023)
++++++++++

**Changed**

- Fixes tomogram filter default state on collection page

++++++++++
v0.4.1 (07/02/2023)
++++++++++

**Changed**

- Fixes auth redirects

++++++++++
v0.4.0 (07/02/2023)
++++++++++

**Added**

- "Current Sessions" section to homepage
- Session list now displays microscope ID alongside human-readable name
- Tomography reprocessing (currently disabled)

**Changed**

- Dose weight removed from motion correction
- Multiple tomograms are now allowed per data collection
- Images now display skeleton while loading
- Data for SPA and tomography is loaded before the page is rendered

++++++++++
v0.3.1 (01/02/2023)
++++++++++

**Changed**

- Removes :code:`v` prefix from footer

++++++++++
v0.3.0 (01/02/2023)
++++++++++

**Added**

- Data collection statistics page for single particle analysis
- Users can now search through collections (tomogram) in a data collection group

**Changed**

- Resets listing page when searching
- Performs auth before page is loaded, avoids multiple "refreshes"

++++++++++
v0.2.1 (27/01/2023)
++++++++++

**Changed**

- Every request displays loading bar, instead of loading bar state being changed by hand
- Fixes tilt alignment axis display in tomograms

++++++++++
v0.2.0 (23/01/2023)
++++++++++

**Added**

- Relion processing dialog (inactive)
- Plot for relative ice thickness data in particle picking data
- 3D visualisation (page through movie frames, XY/XZ projections)

**Changed**

- Data for hidden processing jobs doesn't get downloaded until they are visible
- "Running", "Queued" and "Submitted" job statuses are now supported
- 2D classification component shows message when no data is available
- "Beamlines" in session table changed to "Microscopes"
- Microscopes are now displayed as a human readable value instead of their beamline ID
- In order to allow interactivity with plots, only clicking image/plot titles opens up the modal, instead of the whole card
- Fixes year on footer
- Accessibility improvements to pagination

++++++++++
v0.1.0 (11/01/2023)
++++++++++

**Added**

- Experiment type is displayed on the "data collection group" table
- Dedicated single particle analysis page (new particle picking and 2d classification components)
- User can now pick between displaying all data collections, or only ones with valid tomograms

**Changed**

- Visit number is displayed instead of session ID in data collection page
- Visual tweaks and improvements

++++++++++
v0.0.1 (14/12/2022)
++++++++++

**Changed**

- Images now stick to title on modals, instead of floating to middle
- First "actual release"

++++++++++
v0.0.1-rc4 (2/12/2022)
++++++++++

**Added**

- Data collection page works better on smaller screens

**Changed**

- Fixes scatter plot width on page resize
- Astigmatism and defocus are now displayed with the correct units
- Fixed cropping images on modal
- Motion correction for tomograms starts near the smallest tilt alignment angle (roughly the middle)

++++++++++
v0.0.1-rc3 (30/11/2022)
++++++++++

**Added**

- Motion correction can now be viewed for tomograms that are still being processed

**Changed**

- Pagination for data collections accompanies the URL parameter properly
- Fixes image sizing on pop-up modal

++++++++++
v0.0.1-rc2 (25/11/2022)
++++++++++

**Added**

- Data collection group before data collections
- Pixel size, voltage and image size in data collection

**Changed**

- Tilt angle is shown more proeminently
- Drift plot is now correctly rendered
- Visual tweaks
- Data collections are now "flipped" through, from a data collection group, instead of selected from a list
- Data collection comments are now used as tomogram title
- Motion correction is now the first row in a tomogram display

+++++++++
v0.0.1-rc1 (21/11/2022)
+++++++++

Initial version.
