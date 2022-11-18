eBIC Web App
===========================

|code_ci| |docs_ci| |coverage| |pypi_version| |license|

============== ==============================================================
Source code    https://gitlab.diamond.ac.uk/yrh59256/ebic-frontend
============== ==============================================================

Web app for displaying eBIC related information.

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

.. |code_ci| image:: https://github.com/DiamondLightSource/python3-pip-skeleton/actions/workflows/code.yml/badge.svg?branch=main
    :target: https://github.com/DiamondLightSource/python3-pip-skeleton/actions/workflows/code.yml
    :alt: Code CI

.. |docs_ci| image:: https://github.com/DiamondLightSource/python3-pip-skeleton/actions/workflows/docs.yml/badge.svg?branch=main
    :target: https://github.com/DiamondLightSource/python3-pip-skeleton/actions/workflows/docs.yml
    :alt: Docs CI

.. |coverage| image:: https://codecov.io/gh/DiamondLightSource/python3-pip-skeleton/branch/main/graph/badge.svg
    :target: https://codecov.io/gh/DiamondLightSource/python3-pip-skeleton
    :alt: Test Coverage

.. |pypi_version| image:: https://img.shields.io/pypi/v/python3-pip-skeleton.svg
    :target: https://pypi.org/project/python3-pip-skeleton
    :alt: Latest PyPI version

.. |license| image:: https://img.shields.io/badge/License-Apache%202.0-blue.svg
    :target: https://opensource.org/licenses/Apache-2.0
    :alt: Apache License

..
    Anything below this line is used when viewing README.rst and will be replaced
    when included in index.rst
