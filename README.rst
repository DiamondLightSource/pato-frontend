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

For production deployment using Kubernetes, visit the `backend's repository <https://gitlab.diamond.ac.uk/yrh59256/ebic-frontend>`_

============
Testing
============

- Run :code:`yarn test`

.. |code_ci| image:: https://gitlab.diamond.ac.uk/yrh59256/ebic-frontend/badges/master/pipeline.svg
    :alt: Code CI
..
    Anything below this line is used when viewing README.rst and will be replaced
    when included in index.rst
