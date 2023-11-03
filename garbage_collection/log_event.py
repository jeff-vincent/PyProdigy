import time

# Write output to a file
with open('event_log.txt', 'w') as f:
    f.write(str(time.time()))

