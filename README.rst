PATo
===========================

|code_ci| |coverage| |license|

============== ==============================================================
Source code    https://github.com/DiamondLightSource/pato-frontend
============== ==============================================================

Particle Analysis and Tomography Visualization Interface

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

.. |code_ci| image:: https://github.com/DiamondLightSource/pato-frontend/actions/workflows/node.js.yml/badge.svg
    :target: https://github.com/DiamondLightSource/pato-frontend/actions/workflows/node.js.yml
    :alt: Code CI

.. |license| image:: https://img.shields.io/badge/License-Apache%202.0-blue.svg
    :target: https://opensource.org/licenses/Apache-2.0
    :alt: Apache License
