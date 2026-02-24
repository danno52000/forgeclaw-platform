# Trivial test to isolate Northflank issues
FROM node:22-bookworm

# Just echo something
RUN echo 'ForgeClaw test image building...'

# Simple startup
CMD ["node", "--version"]
