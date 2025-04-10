PATo
===========================

|code_ci| |license|

============== ==============================================================
Source code    https://github.com/DiamondLightSource/pato-frontend
============== ==============================================================

Particle Analysis and Tomography Visualization Interface

==========
Configuration
==========

- REACT_APP_API_ENDPOINT: API URL
- REACT_APP_AUTH_ENDPOINT: Auth URL
- REACT_APP_STAGING_URL: Staging deployment URL
- REACT_APP_DEV_CONTACT: Developer contact email
- REACT_APP_DEPLOY_TYPE: Deployment type
- REACT_APP_VERSION: App version
- REACT_APP_AUTH_TYPE: Authentication type. Can be :code:`oidc` or :code:`dummy`
- REACT_APP_FEEDBACK_URL: Feedback form URL
- REACT_APP_SAMPLE_HANDLING_URL: URL pointing to sample handling instance

==========
Deployment
==========

Running development server on your machine:

.. code-block:: bash

    yarn install --immutable --immutable-cache --check-cache

    yarn start

There is also a production Docker container available. Nevertheless, you can compile a production-optimised build with :code:`yarn build` instead.

============
Testing
============

- Run :code:`yarn test`

.. |code_ci| image:: https://github.com/DiamondLightSource/pato-frontend/actions/workflows/test.yml/badge.svg
    :target: https://github.com/DiamondLightSource/pato-frontend/actions/workflows/test.yml
    :alt: Code CI

.. |license| image:: https://img.shields.io/badge/License-Apache%202.0-blue.svg
    :target: https://opensource.org/licenses/Apache-2.0
    :alt: Apache License
