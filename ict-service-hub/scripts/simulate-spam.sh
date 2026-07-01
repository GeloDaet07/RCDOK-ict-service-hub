#!/bin/bash
echo "Simulating Spam Attack against ICT Service Hub..."
echo "Executing 10 consecutive guest ticket submissions from this IP..."
echo ""

curl -s http://localhost:3000/api/test-spam | jq

echo ""
echo "Simulation complete. Check your admin dashboard's Spam Monitoring page to see the blocked attempts!"
