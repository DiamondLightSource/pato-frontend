PATo
===========================

|code_ci| |license|

============== ==============================================================
Source code    https://github.com/DiamondLightSource/pato-frontend/
============== ==============================================================

Particle Analysis and Tomography Visualization Interface

==========
Configuration
==========

Build time:

- VITE_APP_VERSION: App version (read from the environment or a :code:`.env` file when running :code:`yarn build`)

Run time:

Create a configuration file named `config.js`, based on `config.example.js`, and mount custom runtime configs on the root of the deployment folder (e.g.: :code:`/usr/share/nginx/html` for nginx). In local development mode, modify :code:`config.js` in :code:`/public` instead.

- API_URL: base URL for API endpoints
- AUTH_URL: base URL for authentication endpoints
- DEV_CONTACT: email used for contacting application support
- ENVIRONMENT: application environment - one of 'production', 'staging' or 'demo'
- FEEDBACK_URL (optional): URL pointing to form that takes user feedback
- REPROCESSING_ENABLED: whether to show or hide reprocessing buttons

==========
Deployment
==========

The project is built with `Vite <https://vite.dev>`_. Running development server on your machine (served at http://localhost:3000, with hot module replacement):

.. code-block:: bash

    yarn install --immutable --immutable-cache --check-cache

    yarn start

There is also a production Docker container available. Nevertheless, you can compile a production-optimised build into the :code:`build` folder with :code:`yarn build` (this type checks the project first), and serve it locally with :code:`yarn preview`.

Other useful scripts: :code:`yarn typecheck` (TypeScript only), :code:`yarn lint` (ESLint) and :code:`yarn format` (Prettier).

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
