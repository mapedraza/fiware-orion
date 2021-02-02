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
#include <map>

#include "mongoDriver/BSONObj.h"

#include "logMsg/logMsg.h"  // FIXME OLD-DR: remove after use

namespace orion
{
/* ****************************************************************************
*
* BSONObj::BSONObj -
*/
BSONObj::BSONObj()
{
  b = bson_new();
  //LM_I(("BSONObj empty constructor - bson_new %x %x", this, b));
}



/* ****************************************************************************
*
* BSONObj::BSONObj -
*/
BSONObj::BSONObj(const BSONObj& _bo)
{
  b = bson_copy(_bo.b);
  bo = _bo.bo;
  //LM_I(("BSONObj constructor with BSON - bson_new %x %x", this, b));
}



/* ****************************************************************************
*
* BSONObj::~BSONObj -
*/
BSONObj::~BSONObj(void)
{
  //LM_I(("BSONObj destructor - bson_destroy %x %x", this, b));
  bson_destroy(b);
}



/* ****************************************************************************
*
* BSONObj::getFieldNames -
*/
int BSONObj::getFieldNames(std::set<std::string>& fields) const
{
  return bo.getFieldNames(fields);
}



/* ****************************************************************************
*
* BSONObj::hasField -
*/
bool BSONObj::hasField(const std::string& field) const
{
  return bo.hasField(field);
}



/* ****************************************************************************
*
* BSONObj::nFields -
*/
int BSONObj::nFields(void) const
{
  return bo.nFields();
}



/* ****************************************************************************
*
* BSONObj::toString -
*/
std::string BSONObj::toString(void) const
{
  return bo.toString();
}



/* ****************************************************************************
*
* BSONObj::toString -
*/
std::string BSONObj::_toString(void) const
{
  char* str = bson_as_relaxed_extended_json(b, NULL);
  std::string s(str);
  bson_free(str);
  return s;
}


/* ****************************************************************************
*
* BSONObj::isEmpty -
*/
bool BSONObj::isEmpty(void)
{
  return bo.isEmpty();
}



/* ****************************************************************************
*
* BSONObj::toStringMap -
*/
void BSONObj::toStringMap(std::map<std::string, std::string>* m)
{
  for (mongo::BSONObj::iterator i = bo.begin(); i.more();)
  {
    mongo::BSONElement e = i.next();

    (*m)[e.fieldName()] = e.String();
  }
}



/* ****************************************************************************
*
* BSONObj::toElementsVector -
*/
void BSONObj::toElementsVector(std::vector<BSONElement>* v)
{
  for (mongo::BSONObj::iterator i = bo.begin(); i.more();)
  {
    BSONElement e(i.next());
    v->push_back(e);
  }
}



/* ****************************************************************************
*
* BSONObj::operator= -
*
* FIXME OLD-DR: we should try to use const BSONObj& as argument
*/
BSONObj& BSONObj::operator= (BSONObj rhs)
{
  // check not self-assignment
  if (this != &rhs)
  {
    // destroy existing b object, then copy rhs.b object
    //LM_I(("BSONOb operator = - bson_destroy %x %x", this, b));
    bson_destroy(b);
    b = bson_copy(rhs.b);

    bo = rhs.bo;
  }
  return *this;
}



///////// from now on, only methods with low-level driver types in return or parameters /////////



/* ****************************************************************************
*
* BSONObj::BSONObj -
*/
BSONObj::BSONObj(const mongo::BSONObj& _bo)
{
  bo = _bo;
  b = bson_new();
  //LM_I(("BSONObj constructor with mongo::BSONObj - bson_new %x %x", this, b));
}



/* ****************************************************************************
*
* BSONObj::BSONObj -
*
* FIXME OLD-DR: probably this is not needed at the end
*/
BSONObj::BSONObj(const mongo::BSONObj& _bo, bson_t* _b)
{
  bo = _bo;
  b = bson_copy(_b);
  //LM_I(("BSONObj constructor with mongo::BSONObj - bson_new %x %x", this, b));
}



/* ****************************************************************************
*
* BSONObj::BSONObj -
*
*/
BSONObj::BSONObj(bson_t* _b)
{
  b = bson_copy(_b);
}



/* ****************************************************************************
*
* BSONObj::get -
*/
mongo::BSONObj BSONObj::get(void) const
{
  return bo;
}



/* ****************************************************************************
*
* BSONObj::_get -
*/
bson_t* BSONObj::_get(void) const
{
  return b;
}
}
