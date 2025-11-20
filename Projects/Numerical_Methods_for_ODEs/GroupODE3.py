#!/usr/bin/env python3

#Purpose:Euler's Method to predict world population from 1950-2020
#By: Clancy Crawford
#Group with: Wylie Roberts (Part 1) and Hillary Spang (Part 2)
#Date: 10/25/2025

import numpy as np
import math
import matplotlib.pyplot as plt


# Given Parameters
k_rm = 0.026 # per/yr
p_max = 12000 # million people
p0 = 2555 # million people in year start
yr_start = 1950
yr_end = 2020


# Given Function
def f(p):
    return k_rm*(1 - (p/p_max))*p

# Given Data for time
t_data = np.arange(yr_start, yr_end + 1, 1) #must go up by one then extract later
t_len = len(t_data)
#print(t_data)

# Data for p
p_data_given = np.array([2555, 3040, 3708, 4454, 5276, 6079, 6922, 7753], float)
p_data = np.zeros(t_len)
p_data[0] = p0

for i in range(t_len - 1):
    p_data[i+1] = p_data[i] + 1 * f(p_data[i])


#Extracting Values
t_data_actual = np.arange(yr_start, yr_end + 1, 10)
index = t_data_actual - yr_start
p_data_actual = p_data[index]

print()
print("Years (t):                    ", t_data_actual)
print("Population from Euler Method: ", p_data_actual)


# Plotting
plt.figure()
plt.plot(t_data_actual, p_data_actual, label="Euler Method")
plt.scatter(t_data_actual, p_data_given, color = 'orange', label = 'Given Data')
plt.xlabel('Year')
plt.ylabel('Measured Population (Millions)')
plt.title('World''s Population Using Euler''s Method')
plt.grid(True)
plt.legend()
plt.savefig('project_part3_plot.jpg')
plt.show()



