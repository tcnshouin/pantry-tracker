#include<iostream>
using namespace std;

const char Blank = ' ';
const int one = 5;


int main()
{
    int a, b, cc;
    a = one + 5;
    b = a + Blank;
    cc =a + one * 2;
    a = cc + b;

    cout<<"a = "<<a<<", b= "<<b<<", cc = "<<cc<<endl;
    return 0;
}