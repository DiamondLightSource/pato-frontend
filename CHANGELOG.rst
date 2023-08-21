==========
Changelog
==========

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
