PATo
===========================

|code_ci| |code_cov|

============== ==============================================================
Source code    https://gitlab.diamond.ac.uk/lims/pato-frontend
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

There is also a production Docker container. Nevertheless, you can compile a production-optimised build with :code:`yarn build` instead.

For production deployment using Kubernetes, visit `PATo Helm <https://gitlab.diamond.ac.uk/lims/pato-helm>`_.

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
