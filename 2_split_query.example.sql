
0:
"SELECT SUM(`added`) AS `__VALUE__` FROM public.`wikiticker` AS t WHERE (TIMESTAMP('2008-07-24T16:25:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2023-07-24T16:25:00.000Z'))"
1:
"SELECT `cityName` AS `cityName`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE (TIMESTAMP('2008-07-24T16:25:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2023-07-24T16:25:00.000Z')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5"
2:
"SELECT `regionName` AS `regionName`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE ((TIMESTAMP('2008-07-24T16:25:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2023-07-24T16:25:00.000Z')) AND (`cityName`='some_cityName')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5"
3:
"SELECT `countryName` AS `countryName`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE (((TIMESTAMP('2008-07-24T16:25:00.000Z')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP('2023-07-24T16:25:00.000Z')) AND (`cityName` IS NULL)) AND (`regionName`='some_regionName')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5"
4:
'SELECT `countryName` AS `countryName`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE (((TIMESTAMP(\'2008-07-24T16:25:00.000Z\')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP(\'2023-07-24T16:25:00.000Z\')) AND (`cityName`="Bogotá")) AND (`regionName`=\'some_regionName\')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5'
5:
'SELECT `countryName` AS `countryName`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE (((TIMESTAMP(\'2008-07-24T16:25:00.000Z\')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP(\'2023-07-24T16:25:00.000Z\')) AND (`cityName`="London")) AND (`regionName`=\'some_regionName\')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5'
6:
'SELECT `countryName` AS `countryName`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE (((TIMESTAMP(\'2008-07-24T16:25:00.000Z\')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP(\'2023-07-24T16:25:00.000Z\')) AND (`cityName`="Bhopal")) AND (`regionName`=\'some_regionName\')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5'
7:
'SELECT `countryName` AS `countryName`, SUM(`added`) AS `added` FROM public.`wikiticker` AS t WHERE (((TIMESTAMP(\'2008-07-24T16:25:00.000Z\')<=`sometimeLater` AND `sometimeLater`<TIMESTAMP(\'2023-07-24T16:25:00.000Z\')) AND (`cityName`="Central District")) AND (`regionName`=\'some_regionName\')) GROUP BY 1 ORDER BY `added` DESC LIMIT 5'
__len__:
8