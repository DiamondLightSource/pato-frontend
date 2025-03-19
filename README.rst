PATo
===========================

|code_ci| |code_cov|

============== ==============================================================
Source code    https://github.com/DiamondLightSource/pato-frontend/
============== ==============================================================

Particle Analysis and Tomography Visualization Interface

==========
Configuration
==========

Build time:

- REACT_APP_VERSION: App version

Run time:

Create a configuration file named `config.js`, based on `config.example.js`, and mount custom runtime configs on the root of the deployment folder

- API_URL: base URL for API endpoints
- AUTH_URL: base URL for authentication endpoints
- DEV_CONTACT: email used for contacting application support
- ENVIRONMENT: application environment - one of 'production', 'staging' or 'dev'
- FEEDBACK_URL (optional): URL pointing to form that takes user feedback

==========
Deployment
==========

Running development server on your machine:

.. code-block:: bash

    yarn install --immutable --immutable-cache --check-cache

    yarn start

There is also a production Docker container. Nevertheless, you can compile a production-optimised build with :code:`yarn build` instead.

============
Testing
============

- Run :code:`yarn test`

.. |code_ci| image:: https://gitlab.diamond.ac.uk/lims/pato-frontend/badges/master/pipeline.svg
    :alt: Code CI

.. |code_cov| image:: https://gitlab.diamond.ac.uk/lims/pato-frontend/badges/master/coverage.svg
    :alt: Code Coverage
..
    Anything below this line is used when viewing README.rst and will be replaced
    when included in index.rst
