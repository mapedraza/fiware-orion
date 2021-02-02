/*
*
* Copyright 2020 Telefonica Investigacion y Desarrollo, S.A.U
*
* This file is part of Orion Context Broker.
*
* Orion Context Broker is free software: you can redistribute it and/or
* modify it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* Orion Context Broker is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
* General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with Orion Context Broker. If not, see http://www.gnu.org/licenses/.
*
* For those usages not covered by this license please contact with
* iot_support at tid dot es
*
* Author: Fermín Galán
*/

#include <string>

#include "mongoDriver/OID.h"

namespace orion
{
/* ****************************************************************************
*
* OID::OID -
*/
OID::OID()
{
}



/* ****************************************************************************
*
* OID::OID -
*/
OID::OID(const std::string& id)
{
  oid = mongo::OID(id);
  bson_oid_init_from_string(&_oid, id.c_str());
}



/* ****************************************************************************
*
* OID::init -
*/
void OID::init(void)
{
  bson_oid_init(&_oid, NULL);
  oid.init(toString()); // FIXME OLD-DR: ugly, but it will be removed soon
}



/* ****************************************************************************
*
* OID::toString -
*/
std::string OID::toString(void)
{
  char str[25];  // OID fixed length is 24 chars
  bson_oid_to_string(&_oid, str);
  return std::string(str);
}



///////// from now on, only methods with low-level driver types in return or parameters /////////



/* ****************************************************************************
*
* OID::get -
*/
mongo::OID OID::get(void) const
{
  return oid;
}


/* ****************************************************************************
*
* OID::_get -
*/
bson_oid_t OID::_get(void) const
{
  return _oid;
}



/* ****************************************************************************
*
* OID::OID -
*/
OID::OID(const mongo::OID& _bo)
{
  oid = _bo;
  bson_oid_init_from_string(&_oid, oid.toString().c_str());
}
}
