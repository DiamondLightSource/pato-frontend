==========
Changelog
==========

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
