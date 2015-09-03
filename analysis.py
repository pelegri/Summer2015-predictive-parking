
# coding: utf-8

# In[1]:

files = sc.textFile("mergeddata.txt")


# In[2]:

cached_files = files.cache()


# In[3]:

import re
import json
from datetime import datetime, timedelta


# In[4]:

REGEX_PATTERN = '(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})'


# In[5]:

def split(x):
    splits = re.split("\}\{",x)
    for i in range(len(splits)):
        if i == 0: 
            splits[i] = splits[i] + '}'
        elif i == len(splits)-1:
            splits[i] = '{' + splits[i]
        else:
            splits[i] = '{' + splits[i] + '}'
    return splits


# In[6]:

def toDelta(x):
    if x == 'America/Los_Angeles':
        td = timedelta(hours=-4)
    elif x == 'Australia/Sydney':
        td = timedelta(hours=13)
    else:
        td = timedelta(hours=0)
    return td


# In[7]:

def createdatetime(x):
    match = re.search(REGEX_PATTERN, x)
    year = int(match.group(1))
    month = int(match.group(2))
    day = int(match.group(3))
    hour = int(match.group(4))
    minute = int(match.group(5))
    second = int(match.group(6))
    dt = datetime(year=year,month=month,day=day,hour=hour,minute=minute,second=second)
    return dt
print createdatetime( "2015-06-26T202708-0400")


# In[8]:

dicts = cached_files.map(lambda x: split(x)).collect()


# In[9]:

etc = sc.parallelize(dicts[0]).map(lambda x: json.loads(x))


# In[10]:

import pandas as pd


# In[11]:

df = pd.DataFrame(etc.collect())


# In[12]:

def latlon(x):
    return (x['lat'],x['lon'])


# In[13]:

df['coords'] = pd.DataFrame(df['weather_field']).applymap(latlon)


# In[14]:

def encode(x):
    lat = x[0].encode('utf-8')
    lon = x[1].encode('utf-8')
    return lat + ', ' + lon


# In[15]:

newdf = df.drop('weather_field',1)


# In[16]:

newdfa = pd.DataFrame()


# In[17]:

def vacancy(x):
    return x['vacancy']
def count(x):
    return x['count']


# In[18]:

def gethour(x):
    return x.hour


# In[19]:

newdfa['coordinates'] = pd.DataFrame(df['weather_field']).applymap(latlon).applymap(encode)
newdfa['vacancy'] = pd.DataFrame(newdf['vacancy_field']).applymap(vacancy)
#newdfa['count'] = pd.DataFrame(newdf['vacancy_field']).applymap(count)
newdfa['dt'] = pd.DataFrame(newdf['time']).applymap(createdatetime)
newdfa['timezone'] = pd.DataFrame(newdf['timezone']).applymap(toDelta)
newdfa['dtn'] = newdfa['dt'] + newdfa['timezone']
newdfa['hour'] = pd.DataFrame(newdfa['dtn']).applymap(gethour)


# In[20]:

#newdfa.drop('dt',1)
#newdfa.drop('timezone',1)


# In[21]:

#d = newdfa.ix[newdfa.groupby('coords')['vacancy'].transform(average)]
#newdfa.ix[d[['vacancy']].transform(average).sort('vacancy')]
#newdfa.ix[d['vacancy']]
groupeddfa = newdfa.groupby(['coordinates','hour'])
groupeddfa.mean()


# In[22]:

groupeddfa.mean().to_csv('result4.csv')


# In[46]:

newdfa.coordinates[0]

