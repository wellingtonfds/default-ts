FROM node:12

WORKDIR /usr/crawler-connector
# Add package file
COPY package*.json ./

# Install deps
#RUN npm i
RUN apt update && apt install cron -y
RUN echo "* * * * * /usr/crawler-connector/crawlercron.sh >> /var/log/cron.log" > /etc/cron.d/crawler.cron && \
    chmod 0644 /etc/cron.d/crawler.cron && \
    crontab /etc/cron.d/crawler.cron && \
    touch /var/log/cron.log && \
    chmod 777 /var/log/cron.log
# Copy source
COPY . .
RUN echo "#!/bin/bash" > /usr/local/bin/start.sh && \
    echo "cron && npm run dev" >> /usr/local/bin/start.sh && \
    chmod +x /usr/local/bin/start.sh
CMD /usr/local/bin/start.sh
#CMD ["npm", "run", "dev"]
# Expose port 3000
EXPOSE 3100
